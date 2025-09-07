
# Component Architecture - Atomic Design

This project follows the Atomic Design methodology for organizing components into a scalable, maintainable structure.

## Structure Overview

```
src/components/
├── atoms/           # Basic building blocks
│   ├── Button/
│   ├── Input/
│   ├── Select/
│   └── Badge/
├── molecules/       # Groups of atoms functioning together
│   ├── WorkTypeSelector/
│   └── ProductivityRow/
└── organisms/       # Groups of molecules forming distinct sections
    └── ProductivityTable/
```

## Design Principles

### Atoms (Basic Elements)
- **Button**: Reusable button component with variants and states
- **Input**: Form input with label, validation, and helper text
- **Select**: Dropdown component with options and validation
- **Badge**: Status/category indicator component

### Molecules (Component Groups)
- **WorkTypeSelector**: Combines Select atom with work type logic
- **ProductivityRow**: Combines multiple atoms to create table rows with edit/view states

### Organisms (Complex Components)
- **ProductivityTable**: Complete table functionality combining multiple molecules

## Usage Guidelines

1. **Atoms** should be pure, reusable, and not depend on business logic
2. **Molecules** can contain simple business logic specific to their purpose
3. **Organisms** handle complex interactions and state management
4. Always prefer composition over inheritance
5. Keep components focused on a single responsibility

## Adding New Components

When adding new components:
1. Determine the appropriate atomic level
2. Create a folder with the component name
3. Include TypeScript interfaces for props
4. Add proper error handling and accessibility
5. Document any specific usage requirements
