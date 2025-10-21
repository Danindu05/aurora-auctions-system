import clsx from "clsx";

const baseStyles = "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-50";

const variants = {
  primary: "bg-gold text-white hover:bg-emerald-600 hover:text-white shadow-lux",
  secondary: "bg-white text-emerald-700 border border-emerald-200 hover:border-emerald-400 hover:text-emerald-800",
  link: "text-emerald-700 hover:text-emerald-800 px-0 py-0",
};

const Button = ({ variant = "primary", className = "", children, ...props }) => {
  return (
    <button className={clsx(baseStyles, variants[variant], className)} {...props}>
      {children}
    </button>
  );
};

export default Button;
