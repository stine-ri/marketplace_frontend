import React from 'react';
import { Briefcase, Home, Paintbrush, Wrench, GraduationCap, Car, ShoppingBag, Monitor, Shirt, Gift, ArrowRight, Sparkles } from 'lucide-react';

export const CategorySection = () => {
  const serviceCategories = [
    {
      icon: Briefcase,
      name: 'Business Services',
      description: 'Marketing, Legal, Finance',
      color: 'blue',
      keywords: 'business consulting Kenya, marketing services Nairobi, legal services, financial advisors'
    },
    {
      icon: Home,
      name: 'Home Services',
      description: 'Cleaning, Repairs, Gardening',
      color: 'green',
      keywords: 'home cleaning Kenya, plumber Nairobi, gardening services, house repairs'
    },
    {
      icon: Paintbrush,
      name: 'Creative Services',
      description: 'Design, Writing, Photography',
      color: 'purple',
      keywords: 'graphic design Kenya, content writing, photographer Nairobi, video editing'
    },
    {
      icon: Wrench,
      name: 'Technical Services',
      description: 'IT Support, Development',
      color: 'orange',
      keywords: 'web developer Kenya, IT support Nairobi, software development, tech services'
    },
    {
      icon: GraduationCap,
      name: 'Education & Training',
      description: 'Tutoring, Coaching, Training',
      color: 'red',
      keywords: 'tutors Kenya, online coaching, professional training Nairobi, academic tutoring'
    }
  ];

  const productCategories = [
    {
      icon: Monitor,
      name: 'Electronics',
      description: 'Gadgets, Computers, Audio',
      color: 'yellow',
      keywords: 'buy electronics Kenya, laptops Nairobi, smartphones, audio equipment'
    },
    {
      icon: Shirt,
      name: 'Fashion & Apparel',
      description: 'Clothing, Accessories, Shoes',
      color: 'pink',
      keywords: 'fashion Kenya, clothing Nairobi, shoes online, accessories'
    },
    {
      icon: Gift,
      name: 'Handmade & Crafts',
      description: 'Crafts, Art, Jewelry',
      color: 'indigo',
      keywords: 'handmade Kenya, crafts Nairobi, artisan jewelry, unique gifts'
    },
    {
      icon: Car,
      name: 'Automotive',
      description: 'Parts, Accessories, Tools',
      color: 'cyan',
      keywords: 'car parts Kenya, automotive accessories Nairobi, vehicle tools'
    },
    {
      icon: ShoppingBag,
      name: 'All Categories',
      description: 'Browse everything',
      color: 'emerald',
      keywords: 'marketplace Kenya, buy sell Nairobi, online shopping'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; iconBg: string; icon: string; border: string; hover: string }> = {
      blue: {
        bg: 'from-blue-50 to-blue-100/50',
        iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
        icon: 'text-white',
        border: 'border-blue-200',
        hover: 'hover:border-blue-400'
      },
      green: {
        bg: 'from-green-50 to-green-100/50',
        iconBg: 'bg-gradient-to-br from-green-500 to-green-600',
        icon: 'text-white',
        border: 'border-green-200',
        hover: 'hover:border-green-400'
      },
      purple: {
        bg: 'from-purple-50 to-purple-100/50',
        iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
        icon: 'text-white',
        border: 'border-purple-200',
        hover: 'hover:border-purple-400'
      },
      orange: {
        bg: 'from-orange-50 to-orange-100/50',
        iconBg: 'bg-gradient-to-br from-orange-500 to-orange-600',
        icon: 'text-white',
        border: 'border-orange-200',
        hover: 'hover:border-orange-400'
      },
      red: {
        bg: 'from-red-50 to-red-100/50',
        iconBg: 'bg-gradient-to-br from-red-500 to-red-600',
        icon: 'text-white',
        border: 'border-red-200',
        hover: 'hover:border-red-400'
      },
      yellow: {
        bg: 'from-yellow-50 to-yellow-100/50',
        iconBg: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
        icon: 'text-white',
        border: 'border-yellow-200',
        hover: 'hover:border-yellow-400'
      },
      pink: {
        bg: 'from-pink-50 to-pink-100/50',
        iconBg: 'bg-gradient-to-br from-pink-500 to-pink-600',
        icon: 'text-white',
        border: 'border-pink-200',
        hover: 'hover:border-pink-400'
      },
      indigo: {
        bg: 'from-indigo-50 to-indigo-100/50',
        iconBg: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
        icon: 'text-white',
        border: 'border-indigo-200',
        hover: 'hover:border-indigo-400'
      },
      cyan: {
        bg: 'from-cyan-50 to-cyan-100/50',
        iconBg: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
        icon: 'text-white',
        border: 'border-cyan-200',
        hover: 'hover:border-cyan-400'
      },
      emerald: {
        bg: 'from-emerald-50 to-emerald-100/50',
        iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
        icon: 'text-white',
        border: 'border-emerald-200',
        hover: 'hover:border-emerald-400'
      }
    };
    return colorMap[color];
  };

  return (
    <section 
      className="py-16 lg:py-24 bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden"
      itemScope 
      itemType="https://schema.org/ItemList"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 right-20 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-20 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center justify-center px-4 py-2 mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full border border-blue-200">
            <Sparkles size={16} className="text-blue-600 mr-2" />
            <span className="text-sm font-semibold text-blue-700 tracking-wide">EXPLORE CATEGORIES</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 via-blue-800 to-purple-900 bg-clip-text text-transparent">
            Browse by Category
          </h2>
          
          <p className="text-slate-600 text-lg lg:text-xl max-w-3xl mx-auto mb-8">
            Find exactly what you need from our wide range of services and products across Kenya
          </p>

          {/* SEO-rich description */}
          <div className="max-w-4xl mx-auto bg-white/60 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-sm border border-slate-200">
            <p className="text-slate-700 leading-relaxed text-left">
              Explore the diverse marketplace of <strong className="text-slate-900">Quisells</strong>, Kenya's premier platform for buying and selling. 
              Whether you're a <strong className="text-blue-700">client looking for professional services</strong> like home repair, 
              business consulting, or creative design, or you want to <strong className="text-purple-700">buy quality products</strong> from 
              electronics to fashion, our categorized system makes it easy to find trusted local providers and sellers. 
              <span className="text-slate-600"> Service providers can showcase their skills, and product sellers can reach customers across Kenya including Nairobi, Mombasa, Kisumu, and beyond.</span>
            </p>
          </div>
        </div>

        {/* Service Categories Section */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
            <h3 className="px-6 text-xl lg:text-2xl font-bold text-slate-800">
              Professional Services
            </h3>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
            {serviceCategories.map((category, index) => {
              const colors = getColorClasses(category.color);
              const Icon = category.icon;
              
              return (
                <a
                  key={index}
                  href="/services"
                  className={`group bg-gradient-to-br ${colors.bg} rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border ${colors.border} ${colors.hover} relative overflow-hidden cursor-pointer`}
                  itemProp="itemListElement"
                  itemScope
                  itemType="https://schema.org/ListItem"
                  aria-label={`${category.name} - ${category.description}`}
                >
                  <meta itemProp="position" content={String(index + 1)} />
                  <meta itemProp="name" content={category.name} />
                  <meta itemProp="description" content={category.description} />
                  
                  {/* Hover effect background */}
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  
                  <div className={`${colors.iconBg} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                    <Icon size={28} className={colors.icon} />
                  </div>
                  
                  <h3 className="font-bold text-slate-900 mb-2 text-base lg:text-lg" itemProp="name">
                    {category.name}
                  </h3>
                  
                  <p className="text-sm text-slate-600 mb-3" itemProp="description">
                    {category.description}
                  </p>

                  {/* Hidden SEO keywords */}
                  <span className="sr-only">{category.keywords}</span>
                  
                  <div className="flex items-center justify-center text-xs font-semibold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Explore <ArrowRight size={14} className="ml-1" />
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Product Categories Section */}
        <div>
          <div className="flex items-center mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
            <h3 className="px-6 text-xl lg:text-2xl font-bold text-slate-800">
              Shop Products
            </h3>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
            {productCategories.map((category, index) => {
              const colors = getColorClasses(category.color);
              const Icon = category.icon;
              
              return (
                <a
                  key={index}
                  href="/products"
                  className={`group bg-gradient-to-br ${colors.bg} rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border ${colors.border} ${colors.hover} relative overflow-hidden cursor-pointer`}
                  itemProp="itemListElement"
                  itemScope
                  itemType="https://schema.org/ListItem"
                  aria-label={`${category.name} - ${category.description}`}
                >
                  <meta itemProp="position" content={String(serviceCategories.length + index + 1)} />
                  <meta itemProp="name" content={category.name} />
                  <meta itemProp="description" content={category.description} />
                  
                  {/* Hover effect background */}
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  
                  <div className={`${colors.iconBg} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                    <Icon size={28} className={colors.icon} />
                  </div>
                  
                  <h3 className="font-bold text-slate-900 mb-2 text-base lg:text-lg" itemProp="name">
                    {category.name}
                  </h3>
                  
                  <p className="text-sm text-slate-600 mb-3" itemProp="description">
                    {category.description}
                  </p>

                  {/* Hidden SEO keywords */}
                  <span className="sr-only">{category.keywords}</span>
                  
                  <div className="flex items-center justify-center text-xs font-semibold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Browse <ArrowRight size={14} className="ml-1" />
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <a 
              href="/services" 
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              View All Services
            </a>
            <a 
              href="/products" 
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              View All Products
            </a>
            <a 
              href="/help" 
              className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-slate-200 hover:border-blue-300"
            >
              Need Help?
            </a>
          </div>
          
          <p className="mt-6 text-sm text-slate-600">
            Can't find what you're looking for? <a href="/help" className="text-blue-600 hover:text-blue-700 font-semibold underline">Submit a ticket</a> and we'll reach back immediately!
          </p>
        </div>
      </div>

      <style>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  );
}