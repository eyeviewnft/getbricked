import { ConnectButton } from "@rainbow-me/rainbowkit";
import styles from "../../styles/Navbar.module.css";
export default function Navbar() {
	return (
		<nav className={styles.navbar}>
			<a href="https://alchemy.com/?a=create-web3-dapp" target={"_blank"}>
				<img
					className={styles.alchemy_logo}
					src="/getBricked_logo_v2.png"
				></img>
			</a>
			<ConnectButton className={styles.connectButton}></ConnectButton>
		</nav>
	);
}