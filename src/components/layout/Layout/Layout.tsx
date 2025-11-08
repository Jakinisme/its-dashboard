import { Outlet } from "react-router-dom";
import SideNav from "../SideNav";
import styles from "./Layout.module.css";

const Layout = () => {
    return (
        <div className={styles.container}>
            <section className={styles.Sidebar}>
                <div className={styles.sidebarContent}>
                    <SideNav />
                </div>
            </section>
            <section className={styles.MainContent}>
                <Outlet />
            </section>
        </div>
    );
};

export default Layout;

