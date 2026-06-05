import React from 'react';

export const Button = ({ className, children, variant, contentKey, ...props }) => {
  return (
    <button aria-expanded="false" aria-label="Toggle menu" id="mobile-menu-toggle" className={className} {...props}>{children}</button>
  );
};

