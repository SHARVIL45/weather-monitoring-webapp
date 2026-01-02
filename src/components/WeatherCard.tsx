import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { LucideIcon } from "lucide-react";

interface WeatherCardProps {
  title: string;
  value: string;
  unit: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "stable";
  color?: string;
}

export function WeatherCard({ title, value, unit, icon: Icon, trend, color = "text-blue-500" }: WeatherCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl">
          {value}
          <span className="text-muted-foreground ml-1">{unit}</span>
        </div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">
            {trend === "up" && "↑ Increasing"}
            {trend === "down" && "↓ Decreasing"}
            {trend === "stable" && "→ Stable"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
