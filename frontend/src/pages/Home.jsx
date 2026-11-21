import { useNavigate } from "react-router-dom";
import Hero from "../components/Hero";

function Home() {
  const navigate = useNavigate();
  return (
    <Hero
      onStart={() => navigate("/dashboard")}
      onDemo={() => navigate("/dashboard")}
    />
  );
}

export default Home;
