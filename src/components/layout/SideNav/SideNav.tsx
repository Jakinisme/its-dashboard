import { NavLink } from "react-router-dom";
import Button from "../../ui/Button";
import Profile from "../../ui/Profile/Profile";
import styles from "./SideNav.module.css";
import { MdDashboard, MdHistory, MdLogout, MdCamera } from "react-icons/md";

const SideNav = () => {
    const menuItems = [
        { path: "/", icon: <MdDashboard className={styles.icon} />, label: "Dashboard" },
        { path: '/camera', icon: <MdCamera className={styles.icon} />, label: "Live Cam" },
        { path: "/history", icon: <MdHistory className={styles.icon} />, label: "History" },
    ];

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    };

    return (
        <nav className={styles.SideNav}>
            <div className={styles.content}>
                <div className={styles.logo}>
                    <span>Dame Ungrr</span>
                </div>

                <div className={styles.menu}>
                    {menuItems.map((item) => (
                        <NavLink 
                            key={item.path} 
                            to={item.path} 
                            end={item.path === "/"}
                            className={({ isActive }) => 
                                `${styles.ButtonMenu} ${isActive ? styles.active : ""}`
                            }
                        >
                            {item.icon}
                            {item.label}
                        </NavLink>
                    ))}
                    <div className={styles.ButtonMenu}>
                        <Button onClick={handleLogout}>
                            <MdLogout className={styles.icon} />
                            Logout
                        </Button>
                    </div>
                </div>
                <Profile />
            </div>
        </nav>
    );
};

export default SideNav;