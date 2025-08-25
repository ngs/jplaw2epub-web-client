import { ApolloProvider } from "@apollo/client";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createBrowserRouter, RouterProvider } from "react-router";
import { apolloClient } from "./apollo/client";
import { SearchPage } from "./pages/SearchPage";
import { theme } from "./theme";

const router = createBrowserRouter([
  {
    path: "/",
    element: <SearchPage />,
  },
]);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ApolloProvider client={apolloClient}>
        <RouterProvider router={router} />
      </ApolloProvider>
    </ThemeProvider>
  );
}

export default App;
