// client/src/components/HtmlRenderer.js
import React from 'react';

const HtmlRenderer = ({ htmlContent }) => {
  return (
    <div 
      className="html-content" 
      dangerouslySetInnerHTML={{ __html: htmlContent }} 
    />
  );
};

export default HtmlRenderer;