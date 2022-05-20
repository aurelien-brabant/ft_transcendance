import React, { Fragment, ReactElement, useState } from "react";

export type TooltipProps = {
  className?: string;
  content: string;
};

const Tooltip: React.FC<TooltipProps> = ({ children, content, className }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <Fragment>
      {React.Children.map(children, (tmp) => {
        const child = tmp as ReactElement;
        const childBaseInlineStyle = child.props.style;
        const childInlineStyle = {
          ...(typeof childBaseInlineStyle === "object"
            ? { ...childBaseInlineStyle }
            : {}),
          position: "relative",
        };

        return React.cloneElement(child, {
          style: childInlineStyle,
          onMouseOver: () => {
            setIsVisible(true);
          },
          onMouseOut: () => {
            setIsVisible(false);
          },

          children: (
            <Fragment>
              {child.props.children}
              {isVisible && (
                <div
                  className={`absolute hover:bg-pink-500 left-0 text-xs uppercase whitespace-nowrap translate-y-4 ${className}`}
                >
                  {content}
                </div>
              )}
            </Fragment>
          ),
        });
      })}
    </Fragment>
  );
};

export default Tooltip;
