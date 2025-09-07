
import { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { mockInventoryData } from "@/services/mock-data/inventory-data";
import { mockBuyerData } from "@/services/mock-data/buyer-data";
import { orderApi } from "@/services/api/order-api";
import { toast } from "sonner";
import { debounce } from "lodash";
import { OrderItem } from "@/types/order";
import { BuyerSelectionResult } from "@/components/menus/BuyerSelectionModal";
import { OrderFileData } from "@/services/api/order-file-service";
import { InventoryItem } from "@/components/inventory/types";

export const useOrderCreation = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  // State
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [buyerSelection, setBuyerSelection] = useState<BuyerSelectionResult | null>(null);
  const [currentOrder, setCurrentOrder] = useState<any | null>(null);
  const [customerName, setCustomerName] = useState<string>("");
  const [isCheckingInventory, setIsCheckingInventory] = useState(false);
  const [orderFileData, setOrderFileData] = useState<OrderFileData | null>(null);
  const [validationErrors, setValidationErrors] = useState<any | null>(null);
  const [fileImported, setFileImported] = useState(false);

  // Fetch inventory items
  const { data: inventoryItems = [], isLoading: isLoadingInventory } = useQuery({
    queryKey: ["inventory-for-order"],
    queryFn: () => mockInventoryData.getInventoryItems(),
  });

  // Fetch buyers data for buyer modal
  const { data: buyers = [], isLoading: isLoadingBuyers } = useQuery({
    queryKey: ["active-buyers"],
    queryFn: () => mockBuyerData.getActiveBuyers(),
  });

  // Create a debounced save function
  const debouncedSave = debounce(async () => {
    await saveDraft();
  }, 500);

  // Load draft order if orderId is provided
  useEffect(() => {
    const loadDraftOrder = async () => {
      if (orderId) {
        try {
          const order = await orderApi.getDraftOrder(orderId);

          if (order) {
            setCurrentOrder(order);
            setOrderItems(order.items || []);

            // Set customer name
            const buyer = buyers.find((b) => b.id === order.buyerId);
            if (buyer) {
              setCustomerName(buyer.name);
            }

            // Set buyer selection
            if (
              order.buyerId &&
              order.salesPersonId &&
              order.inventoryLocationId
            ) {
              setBuyerSelection({
                buyerIds: [order.buyerId],
                salesPersonIds: [order.salesPersonId],
                inventoryLocationIds: [order.inventoryLocationId],
              });
            }
          }
        } catch (error) {
          console.error("Error loading draft order:", error);
          toast.error("Failed to load draft order");
        }
      }
    };

    if (orderId && buyers.length > 0) {
      loadDraftOrder();
    }
  }, [orderId, buyers]);

  // Handle initial selection from OrdersPage
  useEffect(() => {
    if (location.state && !orderId) {
      const state = location.state as {
        buyerIds: string[];
        salesPersonIds: string[];
        inventoryLocationIds: string[];
        orderFileData?: OrderFileData;
        validationErrors?: {
          [key: string]: {
            errors: string[];
            outOfStock?: boolean;
            missingBatch?: boolean;
            invalidPrice?: boolean;
            labIssue?: boolean;
          }
        };
      };

      if (state.orderFileData) {
        // Handle imported order file data
        setOrderFileData(state.orderFileData);
        setValidationErrors(state.validationErrors || null);
        setFileImported(true);
        
        // Set buyer selection from file data
        if (state.orderFileData.customerId) {
          const buyerIds = [state.orderFileData.customerId];
          const inventoryLocationIds = state.orderFileData.inventoryLocationId ? 
            [state.orderFileData.inventoryLocationId] : [];
          
          setBuyerSelection({
            buyerIds,
            salesPersonIds: [],
            inventoryLocationIds,
          });
          
          // Set customer name
          const buyer = buyers.find((b) => b.id === state.orderFileData?.customerId);
          if (buyer) {
            setCustomerName(buyer.name);
          }
          
          // Convert file items to order items
          const newOrderItems: OrderItem[] = [];
          
          if (state.orderFileData.items && state.orderFileData.items.length > 0) {
            state.orderFileData.items.forEach(fileItem => {
              // Find matching inventory item
              const inventoryItem = inventoryItems.find(item => 
                item.batchNumber === fileItem.batchId
              );
              
              if (inventoryItem) {
                const orderItem: OrderItem = {
                  id: `item-${Date.now()}-${inventoryItem.id}`,
                  productId: inventoryItem.id,
                  name: inventoryItem.name,
                  price: fileItem.finalPrice,
                  quantity: fileItem.quantity,
                  totalPrice: fileItem.finalPrice * fileItem.quantity,
                  category: inventoryItem.category,
                  packageSize: inventoryItem.packageSize,
                  batchNumber: inventoryItem.batchNumber,
                  tagNumber: inventoryItem.tagNumber,
                  caseSize: inventoryItem.caseSize,
                  hasValidationErrors: fileItem.validation && !fileItem.validation.valid
                };
                
                newOrderItems.push(orderItem);
              }
            });
            
            setOrderItems(newOrderItems);
          }
        }
        
      } else if (state.buyerIds && state.buyerIds.length > 0) {
        // Handle regular order creation with buyer selection
        setBuyerSelection({
          buyerIds: state.buyerIds,
          salesPersonIds: state.salesPersonIds || [],
          inventoryLocationIds: state.inventoryLocationIds || [],
        });

        // Set customer name from buyer
        const buyer = buyers.find((b) => b.id === state.buyerIds[0]);
        if (buyer) {
          setCustomerName(buyer.name);
        }
      }
    }
  }, [location.state, buyers, inventoryItems, orderId]);

  // Handle buyer selection
  const handleBuyerSelection = (selection: BuyerSelectionResult) => {
    setBuyerSelection(selection);

    // Update customer name
    if (selection.buyerIds.length > 0) {
      const buyer = buyers.find((b) => b.id === selection.buyerIds[0]);
      if (buyer) {
        setCustomerName(buyer.name);
      }
    }
    
    // Trigger save after buyer selection
    debouncedSave();
  };

  // Handle updating item quantity or price
  const handleOrderItemUpdate = (
    row: any,
    update: { field: string; value: any }
  ) => {
    setOrderItems((prev) =>
      prev.map((item) => {
        if (item.productId === row.id) {
          const newItem = { ...item };

          // Update the specified field
          if (update.field === "quantity") {
            const quantity = Math.max(1, update.value); // Ensure minimum quantity of 1
            newItem.quantity = quantity;
            newItem.totalPrice = newItem.price * quantity;
          } else if (update.field === "price") {
            const price = Math.max(0, update.value); // Ensure minimum price of 0
            newItem.price = price;
            newItem.totalPrice = price * newItem.quantity;
          } else if (update.field === "orderQty") {
            // New field for order quantity
            const quantity = Math.max(1, update.value); // Ensure minimum quantity of 1
            newItem.quantity = quantity;
            newItem.totalPrice = newItem.price * quantity;
          } else if (update.field === "orderPrice") {
            // New field for order price
            const price = Math.max(0, update.value); // Ensure minimum price of 0
            newItem.price = price;
            newItem.totalPrice = price * newItem.quantity;
          }

          return newItem;
        }
        return item;
      })
    );
    
    // Trigger save after update
    debouncedSave();
  };

  // Add item to order
  const addItemToOrder = (item: InventoryItem) => {
    setOrderItems((prev) => {
      // Check if this item already exists in orderItems
      const existingItemIndex = prev.findIndex(
        (orderItem) => orderItem.productId === item.id
      );

      if (existingItemIndex >= 0) {
        // If exists, increase quantity
        const newItems = [...prev];
        const existingItem = newItems[existingItemIndex];
        newItems[existingItemIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + 1,
          totalPrice: (existingItem.price || 0) * (existingItem.quantity + 1),
        };
        return newItems;
      } else {
        // If new, add it
        const newItem: OrderItem = {
          id: `item-${Date.now()}-${item.id}`,
          productId: item.id,
          name: item.name,
          price: item.price || 0,
          quantity: 1,
          totalPrice: item.price || 0,
          category: item.category,
          packageSize: item.packageSize,
          batchNumber: item.batchNumber,
          tagNumber: item.tagNumber,
          caseSize: item.caseSize,
        };
        return [...prev, newItem];
      }
    });
    
    // Trigger save after item added
    debouncedSave();
  };

  // Remove item from order
  const removeItemFromOrder = (item: InventoryItem) => {
    setOrderItems((prev) =>
      prev.filter((orderItem) => orderItem.productId !== item.id)
    );
    
    // Trigger save after item removed
    debouncedSave();
  };

  // Check if item is in order
  const isItemInOrder = (itemId: string): boolean => {
    return orderItems.some((orderItem) => orderItem.productId === itemId);
  };

  // Get item quantity in order
  const getItemQuantityInOrder = (itemId: string): number => {
    const item = orderItems.find((orderItem) => orderItem.productId === itemId);
    return item?.quantity || 0;
  };

  // Save draft order
  const saveDraft = async () => {
    if (!buyerSelection || buyerSelection.buyerIds.length === 0) {
      // Don't show error when auto-saving
      return;
    }

    try {
      const buyerId = buyerSelection.buyerIds[0];
      const salesPersonId =
        buyerSelection.salesPersonIds.length > 0
          ? buyerSelection.salesPersonIds[0]
          : undefined;
      const inventoryLocationId =
        buyerSelection.inventoryLocationIds.length > 0
          ? buyerSelection.inventoryLocationIds[0]
          : undefined;

      // Calculate totals
      const totalBatch = orderItems.length;
      const totalUnits = orderItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      const subtotal = orderItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );

      // Calculate total package size
      const packageSizes = orderItems
        .filter((item) => item.packageSize)
        .map((item) => {
          const size = parseFloat(
            item.packageSize?.replace(/[^\d.]/g, "") || "0"
          );
          return size * item.quantity;
        });
      const totalPackageSize =
        packageSizes.length > 0
          ? packageSizes.reduce((sum, size) => sum + size, 0).toFixed(2) + "g"
          : "N/A";

      const orderData: any = {
        id: currentOrder?.id,
        customer: customerName,
        buyerId,
        salesPersonId,
        inventoryLocationId,
        items: orderItems,
        total: `$${subtotal.toFixed(2)}`,
        totalBatch,
        totalUnits,
        totalPackageSize,
        date: new Date().toISOString().split('T')[0], // Add current date
      };

      const savedOrder = await orderApi.saveDraftOrder(orderData);

      // Refresh orders list
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      // Update current order
      setCurrentOrder(savedOrder);
      
      return savedOrder;
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Failed to save draft order");
      throw error;
    }
  };

  // Place order
  const placeOrder = async () => {
    if (!buyerSelection || buyerSelection.buyerIds.length === 0) {
      toast.error("Please select a buyer");
      return;
    }

    if (orderItems.length === 0) {
      toast.error("Please add items to the order");
      return;
    }

    try {
      // First save as draft
      const savedOrder = await saveDraft();

      // Check inventory availability
      setIsCheckingInventory(true);
      const checkedItems = await orderApi.checkInventoryAvailability(
        orderItems
      );

      // Check if any items are out of stock
      const outOfStockItems = checkedItems.filter((item) => item.outOfStock);

      if (outOfStockItems.length > 0) {
        // Update items with availability info
        setOrderItems(checkedItems);
        toast.error(`${outOfStockItems.length} items are out of stock`);
        return;
      }

      // If all items are in stock, place the order with today's date
      if (savedOrder && savedOrder.id) {
        const placedDate = new Date().toISOString().split('T')[0];
        const finalOrder = await orderApi.placeOrder(savedOrder.id, placedDate);

        // Refresh orders list
        queryClient.invalidateQueries({ queryKey: ["orders"] });

        toast.success("Order placed successfully");

        return finalOrder.id;
      } else {
        toast.error("Please save the order as a draft first");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order");
    } finally {
      setIsCheckingInventory(false);
    }
  };

  // Clear all order items
  const handleClearAllItems = () => {
    setOrderItems([]);
    debouncedSave();
  };

  // Handle cell value changes
  const handleCellValueChange = (row: InventoryItem, update: { field: string; value: any }) => {
    if (update.field === "orderQty" || update.field === "orderPrice") {
      // Find if item already exists in order
      const existingItemIndex = orderItems.findIndex(item => item.productId === row.id);
      
      if (existingItemIndex >= 0) {
        // Update existing item
        handleOrderItemUpdate(row, update);
      } else {
        // Add new item to order with specified quantity/price
        const price = update.field === "orderPrice" ? update.value : (row.price || 0);
        const quantity = update.field === "orderQty" ? update.value : 1;
        
        // Create new order item
        const newItem: OrderItem = {
          id: `item-${Date.now()}-${row.id}`,
          productId: row.id,
          name: row.name,
          price: price,
          quantity: quantity,
          totalPrice: price * quantity,
          category: row.category,
          packageSize: row.packageSize,
          batchNumber: row.batchNumber,
          tagNumber: row.tagNumber,
          caseSize: row.caseSize,
        };
        
        setOrderItems(prev => [...prev, newItem]);
        
        // Trigger auto-save
        debouncedSave();
      }
    }
  };

  // Handle row click to auto-trigger updates
  const handleRowClick = (row: InventoryItem) => {
    // If not already in order, add it with default quantity of 1
    if (!isItemInOrder(row.id)) {
      addItemToOrder(row);
    }
  };
  
  // Check if item has validation errors from imported file
  const hasValidationError = (batchId: string): boolean => {
    if (!validationErrors) return false;
    return !!validationErrors[batchId];
  };
  
  // Get validation errors for a batch
  const getValidationErrors = (batchId: string): string[] => {
    if (!validationErrors || !validationErrors[batchId]) return [];
    return validationErrors[batchId].errors || [];
  };

  return {
    orderItems,
    buyerSelection,
    currentOrder,
    customerName,
    isCheckingInventory,
    validationErrors,
    fileImported,
    inventoryItems,
    isLoadingInventory,
    buyers,
    isLoadingBuyers,
    setBuyerSelection,
    handleBuyerSelection,
    handleOrderItemUpdate,
    addItemToOrder,
    removeItemFromOrder,
    isItemInOrder,
    getItemQuantityInOrder,
    saveDraft,
    placeOrder,
    handleClearAllItems,
    handleCellValueChange,
    handleRowClick,
    hasValidationError,
    getValidationErrors
  };
};
