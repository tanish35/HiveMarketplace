import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MintPage from "./pages/MintPage";
// import MyNFTPage from "./pages/MyNFTPage";
// import NFTDetailsPage from "./pages/NFTDetailsPage";
// import { RegisterPage } from "./pages/Register";
// import { LoginPage } from "./pages/Login";
import { ThemeProvider } from "./components/theme-provider";
// import NotFound from "./pages/NotFound";

// import { Layout } from "./pages/Layout";
// import { Dashboard } from "./pages/Dashboard";
// import MarketplacePage from "./pages/Marketplace";
// import BuyPage from "./pages/BuyNFTPage";
// import NFTPage from "./pages/NFTPage";
// import AboutPage from "./pages/About";
// import TeamPage from "./pages/Contact";
// import NFTAuctionPage from "./pages/NFTPage";
import { TooltipProvider } from "@/components/ui/tooltip";
// import EditProfile from "./pages/EditProfile";
// import Leaderboard from "./pages/Leaderboard";

function App() {
  return (
    <TooltipProvider>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <Router>
          <Routes>
            {/* <Route path="*" element={<NotFound />} /> */}
            {/* <Route path="/register" element={<RegisterPage />} /> */}
            {/* <Route path="/login" element={<LoginPage />} /> */}
            {/* <Route path="/" element={<Layout />}> */}
            {/* <Route path="/" element={<Dashboard />} /> */}
            <Route path="/mint" element={<MintPage />} />
            {/* <Route path="/my-nft" element={<MyNFTPage />} /> */}
            {/* <Route path="/about" element={<AboutPage />} /> */}
            {/* <Route path="/nft/:id" element={<NFTPage />} /> */}
            {/* <Route path="/contact" element={<TeamPage />} /> */}
            {/* <Route path="/leaderboard" element={<Leaderboard />} /> */}
            {/* <Route path="/edit-profile" element={<EditProfile/>} /> */}
            {/* </Route> */}
            {/* <Route path="/nft/:id" element={<NFTDetailsPage />} /> */}
            {/* <Route path="/marketplace" element={<MarketplacePage />} /> */}
            {/* <Route path="/buy" element={<BuyPage />} /> */}
            {/* <Route path="/auction" element={<NFTAuctionPage />} /> */}
          </Routes>
        </Router>
      </ThemeProvider>
    </TooltipProvider>
  );
}

export default App;
