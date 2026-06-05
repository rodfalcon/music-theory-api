import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

export const Link = ({ className, children, variant, contentKey, ...props }) => {
  const getTo = (href) => {
    if (!href) return '#';
    if (href.endsWith('.html')) {
      const path = href === 'index.html' ? '/' : href.slice(0, -5);
      return path.startsWith('/') ? path : '/' + path;
    }
    return href;
  };

  return (
    <>
          {props.href && (props.href.startsWith('http') || props.href.startsWith('mailto:') || props.href.startsWith('#')) ? (
            <a className={className} {...props}>{children}</a>
          ) : (
            <RouterLink className={className} to={getTo(props.href)} {...props}>{children}</RouterLink>
          )}
        </>
  );
};

