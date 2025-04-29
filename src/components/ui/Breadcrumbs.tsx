"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FaChevronRight, FaHome } from 'react-icons/fa';

interface BreadcrumbItem {
  label: string;
  path: string;
}

const Breadcrumbs = () => {
  const pathname = usePathname();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  useEffect(() => {
    if (pathname) {
      // Skip home/dashboard since it's the root
      if (pathname === '/') {
        setBreadcrumbs([]);
        return;
      }

      // Split pathname by '/' and map to breadcrumb items
      const pathSegments = pathname.split('/').filter(segment => segment);
      
      // Handle special case with dynamic routes
      let breadcrumbItems: BreadcrumbItem[] = [];
      let currentPath = '';
      
      pathSegments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        
        // Handle dynamic team route - show team name instead of ID
        if (index === 1 && pathSegments[0] === 'teams' && segment.match(/^[a-zA-Z0-9]+$/)) {
          breadcrumbItems.push({
            label: 'Team Details',
            path: currentPath
          });
          return;
        }
        
        // Handle dynamic lineup route
        if (index === 1 && pathSegments[0] === 'lineups' && segment.match(/^[a-zA-Z0-9]+$/)) {
          breadcrumbItems.push({
            label: 'Lineup Details',
            path: currentPath
          });
          return;
        }
        
        // Format the label to display (capitalize, replace dashes with spaces)
        const label = segment
          .replace(/-/g, ' ')
          .replace(/^\w|\s\w/g, c => c.toUpperCase());
        
        breadcrumbItems.push({
          label,
          path: currentPath
        });
      });
      
      setBreadcrumbs(breadcrumbItems);
    }
  }, [pathname]);

  // Don't render if we're on the home page or have no breadcrumbs
  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav className="flex mb-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-thunder-primary"
          >
            <FaHome className="mr-2" />
            Home
          </Link>
        </li>
        
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.path} className="inline-flex items-center">
            <FaChevronRight className="text-gray-400 mx-1" size={14} />
            
            {index === breadcrumbs.length - 1 ? (
              // Last item is current page
              <span className="text-sm font-medium text-thunder-primary">
                {breadcrumb.label}
              </span>
            ) : (
              // Clickable breadcrumb
              <Link
                href={breadcrumb.path}
                className="text-sm font-medium text-gray-500 hover:text-thunder-primary"
              >
                {breadcrumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;