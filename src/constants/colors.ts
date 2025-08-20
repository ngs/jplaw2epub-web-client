/**
 * Color palette constants shared between theme and static HTML
 */
export const colors = {
  primary: {
    main: "#29339B", // Dark blue
    light: "#5460C0",
    dark: "#1A2270",
  },
  secondary: {
    main: "#d65612ff", // Orange
  },
  info: {
    main: "#74A4BC", // Light blue
  },
  success: {
    main: "#B6D6CC", // Light green
  },
  warning: {
    main: "#F1FEC6", // Light yellow
  },
  errors: {
    main: "#eeaaaa", // Light pink
  },
} as const;
