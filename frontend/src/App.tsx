import { Container } from "./components/Container";
import { Logo } from "./components/Logo";
import { Card } from "./components/Card";

export function App() {
  return (
    <>
      <Container>
        <Logo />
        <Card />
      </Container>
    </>
  );
}