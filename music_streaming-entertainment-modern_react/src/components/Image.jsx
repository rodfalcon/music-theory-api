import React from 'react';

export const Image = ({ className, children, variant, contentKey, ...props }) => {
  return (
    <img className={className} {...props} />
  );
};

