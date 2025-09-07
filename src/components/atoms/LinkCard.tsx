import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { transitions } from '@/design-system/transitions';
import { shadows } from '@/design-system/shadows';

export interface LinkCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  badge?: React.ReactNode;
}

export const LinkCard: React.FC<LinkCardProps> = ({ title, description, icon, path, badge }) => {
  return (
    <Link to={path} className="block h-full">
      <Card
        className={`h-full ${transitions.default} hover:border-primary/50 ${shadows.md} hover:${shadows.lg}`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">{title}</CardTitle>
            <div className="rounded-full bg-primary/10 p-2 text-primary">{icon}</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between">
            <CardDescription>{description}</CardDescription>
            {badge && badge}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
