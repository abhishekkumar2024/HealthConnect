import { useDarkMode } from "../../contextAPI/contextApi";
import * as React from "react"
import { useState } from "react";
import { cva } from "class-variance-authority"
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react"


const FirstTitleCard = ({ childern }) => {
  return (
    <div className="flex flex-col justify-center items-center space-y-7 ">
      <h3 className="font-bold text-2xl">
        Hello Good afterNoon, WellCome to HealthConnect
      </h3>
      <p1 className="bg-zinc-700 text-wrap px-6 py-9 w-1/2 text-xl rounded-lg shadow-xl">
        your all-in-one healthcare companion! <span className=" px-1 bg-slate-600 border-1 rounded-md"> <a href="">Streamline appointments</a> </span>, manage medical records securely, and connect with top-rated doctors—all from one intuitive platform. Experience the future of healthcare, where care meets convenience, and your health is always in your hands.</p1>
    </div>
  );
}

const Card = ({ children, className = '' }) => {
  const { themeStyles } = useDarkMode();
  return (
    <div className={`${themeStyles.cardBg} backdrop-blur-lg rounded-xl shadow-lg ${className}`}>
      {children}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value }) => {
  const { themeStyles } = useDarkMode();

  return (
    <div className={`${themeStyles.cardBg} p-6 rounded-lg shadow-md flex items-center`}>
      <div className={`${themeStyles.accentBg} p-4 rounded-full mr-4`}>
        <Icon className={`h-6 w-6 ${themeStyles.accentText}`} />
      </div>
      <div>
        <h4 className={`text-lg font-semibold ${themeStyles.text}`}>{label}</h4>
        <p className={`text-sm ${themeStyles.subtext}`}>{value}</p>
      </div>
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => {
  const { themeStyles } = useDarkMode();
  return (
    <div className={`p-6 ${className} ${themeStyles.text}`}>
      {children}
    </div>
  );
};

const CardTitle = ({ children, className = '' }) => {
  const { themeStyles } = useDarkMode();
  return (
    <h2 className={`text-xl font-bold ${className} ${themeStyles.text}`}>
      {children}
    </h2>
  );
};

const CardContent = ({ children, className = '' }) => (
  <div className={`px-6 pb-6 ${className}`}>
    {children}
  </div>
);

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        success:
          "border-green-500/50 text-green-600 dark:text-green-400 [&>svg]:text-green-600 dark:[&>svg]:text-green-400",
        info:
          "border-blue-500/50 text-blue-600 dark:text-blue-400 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400",
        warning:
          "border-yellow-500/50 text-yellow-600 dark:text-yellow-400 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400",
      }
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef(({ className, variant, children, ...props }, ref) => {
  const Icon = {
    default: Info,
    destructive: XCircle,
    success: CheckCircle2,
    warning: AlertTriangle,
    info: Info
  }[variant || 'default']

  return (
    <div
      ref={ref}
      role="alert"
      className={alertVariants({ variant })}
      {...props}
    >
      <Icon className="h-4 w-4" />
      {children}
    </div>
  )
})
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className="mb-1 font-medium leading-none tracking-tight"
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className="text-sm [&_p]:leading-relaxed"
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

// button.jsx
const Button = ({ children, variant = "default", className, ...props }) => {
  const baseStyles = "px-4 py-2 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50";

  const variants = {
    default: "bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700",
    outline: "border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-200",
    ghost: "hover:bg-gray-100 dark:hover:bg-gray-800",
    destructive: "bg-red-500 hover:bg-red-600 text-white"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// badge.jsx
const Badge = ({ children, variant = "default", className, ...props }) => {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";

  const variants = {
    default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    success: "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-200",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200",
    error: "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-200",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200"
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};


export const Tabs = ({ children, defaultValue }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <div>
      {React.Children.map(children, child => 
        React.cloneElement(child, { activeTab, setActiveTab })
      )}
    </div>
  );
};

export const TabsList = ({ children, activeTab, setActiveTab }) => (
  <div className="flex space-x-2 mb-4">
    {React.Children.map(children, child => 
      React.cloneElement(child, { activeTab, setActiveTab })
    )}
  </div>
);

export const TabsTrigger = ({ value, children, activeTab, setActiveTab }) => (
  <button
    className={`px-4 py-2 ${activeTab === value ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
    onClick={() => setActiveTab(value)}
  >
    {children}
  </button>
);

export const TabsContent = ({ value, children, activeTab }) => (
  activeTab === value ? <div>{children}</div> : null
);

export const Select = React.forwardRef(({ onValueChange, value, children, placeholder }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = React.useCallback(
    (nextValue) => {
      onValueChange(nextValue);
      setIsOpen(false);
    },
    [onValueChange]
  );

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full p-2 border rounded flex justify-between items-center"
      >
        <span>{value || placeholder}</span>
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full border rounded mt-1 bg-white shadow-lg">
          {React.Children.map(children, (child) =>
            React.cloneElement(child, {
              onClick: () => handleSelect(child.props.value),
            })
          )}
        </div>
      )}
    </div>
  );
});

export const SelectTrigger = ({ children }) => (
  <div>{children}</div>
);

export const SelectValue = ({ children }) => (
  <span>{children}</span>
);

export const SelectContent = ({ children }) => (
  <div>{children}</div>
); 

export const SelectItem = ({ value, children, onClick: handleClick }) => (
  <div className="cursor-pointer py-1 px-2 hover:bg-gray-200" onClick={() => handleClick(value)}>
    {children}
  </div>
);

export { FirstTitleCard, Card, StatCard, CardHeader, CardTitle, CardContent, Alert, AlertTitle, AlertDescription, Button, Badge };