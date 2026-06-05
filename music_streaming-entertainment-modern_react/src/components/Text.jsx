import React from 'react';

export const Text = ({ className, children, variant, contentKey, ...props }) => {
  return (
    <span className={className} {...props}>{children}</span>
  );
};

