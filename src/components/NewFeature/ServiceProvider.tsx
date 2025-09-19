// src/components/Services/ServiceComponents.tsx
import React from 'react';
import {
  ClockIcon,
  CheckBadgeIcon,
  TagIcon,
  StarIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { formatPrice, formatPriceWithCategory,  } from '../../utilis/priceFormatter';
import {Service }from '../../types/types';
interface ServiceCardProps {
  service: Service;
  isHighlighted?: boolean;
  showPopularBadge?: boolean;
  compact?: boolean;
  onClick?: () => void;
  allPrices?: number[];
  className?: string;
}

interface ServiceGridProps {
  services: Service[];
  maxColumns?: number;
  showPriceRange?: boolean;
  onServiceClick?: (service: Service) => void;
  className?: string;
}

interface PricingTierProps {
  services: Service[];
  className?: string;
}

// Enhanced Service Card with better price display
export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  isHighlighted = false,
  showPopularBadge = true,
  compact = false,
  onClick,
  allPrices = [],
  className = ''
}) => {
  const priceInfo = formatPriceWithCategory(service.price, allPrices);
  
  const getPriceCategoryColor = (category: string) => {
    switch (category) {
      case 'budget':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'premium':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getPopularityBadge = () => {
    if (!showPopularBadge || !service.isPopular) return null;
    
    return (
      <div className="absolute -top-2 -right-2 z-10">
        <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center shadow-sm">
          <FireIcon className="h-3 w-3 mr-1" />
          Popular
        </div>
      </div>
    );
  };

  if (compact) {
    return (
      <div
        className={`relative p-3 rounded-lg border transition-all cursor-pointer group ${
          isHighlighted
            ? 'bg-blue-50 border-blue-300 shadow-sm'
            : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
        } ${className}`}
        onClick={onClick}
      >
        {getPopularityBadge()}
        
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-slate-800 text-sm truncate mb-1">
              {service.name}
            </h4>
            <div className="flex items-center space-x-2">
              <div className="text-base font-semibold text-blue-600">
                {formatPrice(service.price)}
              </div>
              {service.duration && (
                <div className="flex items-center text-xs text-slate-500">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  {service.duration}
                </div>
              )}
            </div>
          </div>
          
          {service.isPopular && (
            <FireIcon className="h-4 w-4 text-amber-500 flex-shrink-0 ml-2" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative p-4 rounded-xl border transition-all cursor-pointer group ${
        isHighlighted
          ? 'bg-blue-50/80 border-blue-300 shadow-sm'
          : 'bg-white/60 border-slate-200 hover:bg-white hover:border-blue-300 hover:shadow-md'
      } ${className}`}
      onClick={onClick}
    >
      {getPopularityBadge()}
      
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-slate-800 text-sm mb-1">{service.name}</h4>
          <div className="flex items-center space-x-2">
            <div className="text-lg font-bold text-blue-600">
              {formatPrice(service.price)}
            </div>
            {service.duration && (
              <div className="flex items-center text-xs text-slate-500">
                <ClockIcon className="h-3 w-3 mr-1" />
                {service.duration}
              </div>
            )}
          </div>
        </div>
        
        {service.isPopular && (
          <FireIcon className="h-5 w-5 text-amber-500 flex-shrink-0 ml-2" />
        )}
      </div>
      
      {service.description && (
        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
          {service.description}
        </p>
      )}
      
      {service.features && service.features.length > 0 && (
        <div className="space-y-1">
          {service.features!.slice(0, 3).map((feature: string, index: number) => (
            <div key={index} className="flex items-center text-xs text-slate-600">
              <CheckBadgeIcon className="h-3 w-3 text-green-500 mr-1.5 flex-shrink-0" />
              <span className="truncate">{feature}</span>
            </div>
          ))}
          {service.features.length > 3 && (
            <div className="text-xs text-slate-500 mt-1">
              +{service.features.length - 3} more features
            </div>
          )}
        </div>
      )}
      
      <div className="mt-3 pt-3 border-t border-slate-100">
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriceCategoryColor(priceInfo.category)}`}>
          {priceInfo.category.charAt(0).toUpperCase() + priceInfo.category.slice(1)}
        </div>
      </div>
    </div>
  );
};

// Service Grid Component
export const ServiceGrid: React.FC<ServiceGridProps> = ({
  services,
  maxColumns = 3,
  showPriceRange = true,
  onServiceClick,
  className = ''
}) => {
const validPrices = services
  .map(service => {
    const rawPrice = service.price;

    if (rawPrice === null || rawPrice === undefined) {
      return null; // skip invalid
    }

    const price = typeof rawPrice === 'string'
      ? parseFloat(rawPrice.replace(/[KSh\s,]/gi, ''))
      : rawPrice;

    return isNaN(price) || price <= 0 ? null : price;
  })
  .filter((price): price is number => price !== null);



  const gridClass = `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(maxColumns, 4)} gap-4`;

  return (
    <div className={className}>
      {showPriceRange && validPrices.length > 0 && (
        <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 text-slate-600 mr-2" />
              <span className="text-sm font-medium text-slate-700">Price Range</span>
            </div>
            <div className="text-lg font-bold text-blue-600">
              {formatPrice(Math.min(...validPrices))} - {formatPrice(Math.max(...validPrices))}
            </div>
          </div>
        </div>
      )}
      
      <div className={gridClass}>
        {services.map((service, index) => (
          <ServiceCard
            key={service.id}
            service={service}
            isHighlighted={index === 0 && services.length > 1}
            allPrices={validPrices}
            onClick={() => onServiceClick?.(service)}
          />
        ))}
      </div>
      
      {services.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
          <TagIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No services available</h3>
          <p className="text-slate-500">Check back later for new service offerings.</p>
        </div>
      )}
    </div>
  );
};

// Pricing Tier Component
export const PricingTier: React.FC<PricingTierProps> = ({
  services,
  className = ''
}) => {
const categorizedServices = services.reduce((acc, service) => {
  const rawPrice = service.price;

  if (rawPrice === null || rawPrice === undefined) {
    return acc; // skip invalid
  }

  const price = typeof rawPrice === 'string'
    ? parseFloat(rawPrice.replace(/[KSh\s,]/gi, ''))
    : rawPrice;

  if (isNaN(price) || price <= 0) return acc;

  const category = price <= 500 ? 'budget' : price <= 2000 ? 'standard' : 'premium';

  if (!acc[category]) {
    acc[category] = [];
  }

  acc[category].push(service);
  return acc;
}, {} as Record<string, Service[]>);


  const tiers = [
    {
      name: 'Budget',
      color: 'green',
      services: categorizedServices.budget || [],
      icon: TagIcon
    },
    {
      name: 'Standard',
      color: 'blue',
      services: categorizedServices.standard || [],
      icon: ArrowTrendingUpIcon
    },
    {
      name: 'Premium',
      color: 'purple',
      services: categorizedServices.premium || [],
      icon: StarIcon
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {tiers.map((tier) => (
        <div key={tier.name} className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center mb-4">
            <div className={`p-2 rounded-lg bg-${tier.color}-50`}>
              <tier.icon className={`h-6 w-6 text-${tier.color}-600`} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 ml-3">{tier.name} Services</h3>
            <span className="ml-auto text-sm text-slate-500">
              {tier.services.length} service{tier.services.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {tier.services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tier.services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  compact={true}
                  className="hover:scale-[1.02] transition-transform"
                />
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-4">No {tier.name.toLowerCase()} services available</p>
          )}
        </div>
      ))}
    </div>
  );
};

// Service List Component (for dropdowns or simple lists)
export const ServiceList: React.FC<{
  services: Service[];
  onServiceSelect?: (service: Service) => void;
  className?: string;
}> = ({ services, onServiceSelect, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {services.map((service) => (
        <div
          key={service.id}
          className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
          onClick={() => onServiceSelect?.(service)}
        >
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-slate-800 text-sm truncate">{service.name}</h4>
            {service.description && (
              <p className="text-xs text-slate-500 truncate">{service.description}</p>
            )}
          </div>
          <div className="ml-4 text-right">
            <div className="font-semibold text-blue-600 text-sm">
              {formatPrice(service.price)}
            </div>
            {service.duration && (
              <div className="text-xs text-slate-500">{service.duration}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};