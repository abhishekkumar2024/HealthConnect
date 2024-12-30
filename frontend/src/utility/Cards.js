import { useDarkMode } from "../contextAPI/contextApi";
import * as React from "react"
import { cva } from "class-variance-authority"
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react"


const FirstTitleCard = ({childern})=>{
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


export { FirstTitleCard, Card, StatCard, CardHeader, CardTitle, CardContent,  Alert, AlertTitle, AlertDescription };