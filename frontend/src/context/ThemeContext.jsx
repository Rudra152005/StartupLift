import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import i18n from "../i18n";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const [language, setLanguageState] = useState("en");

  const [theme, setThemeState] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme;
    }
    // Check system preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "Dark";
    }
    return "Light";
  });

  // Initialize language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Sync theme with user preferences from backend when user logs in
  useEffect(() => {
    if (user?.userPreferences) {
      const userTheme = user.userPreferences.theme || "Dark";
      const userLanguage = user.userPreferences.language || "en";

      setThemeState(userTheme);
      setLanguageState(userLanguage);
      i18n.changeLanguage(userLanguage);

      localStorage.setItem("theme", userTheme);
      localStorage.setItem("language", userLanguage);
    }
  }, [user]);

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;

    // Handle theme based on value
    let effectiveTheme = theme;

    if (theme === "System") {
      // Check system preference
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "Dark" : "Light";
    }

    if (effectiveTheme === "Dark" || effectiveTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Save to localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Apply language
  useEffect(() => {
    localStorage.setItem("language", language);
    i18n.changeLanguage(language);
  }, [language]);

  // Toggle function for navbar/sidebar theme toggle buttons
  const toggleTheme = () => {
    setThemeState((prevTheme) => {
      if (prevTheme === "Light" || prevTheme === "light") {
        return "Dark";
      } else {
        return "Light";
      }
    });
  };

  // Set theme function for Settings components
  const setTheme = (newTheme) => {
    // Accept "Dark", "Light", or "System"
    setThemeState(newTheme);
  };

  // Set language function for Settings components
  const setLanguage = (newLanguage) => {
    setLanguageState(newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, language, setLanguage }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
