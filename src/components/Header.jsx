import logo from '../assets/bull-logo.png';

export default function Header() {
    return (
        <header id="header">
            <img src={logo} alt="React Investment Calculator Logo" />
            <h1>React Investment Calculator</h1>
        </header>
    );
}