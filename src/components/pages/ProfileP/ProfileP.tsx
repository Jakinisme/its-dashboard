import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import styles from "./ProfileP.module.css";
import Button from "../../ui/Button";

const ProfileP = () => {
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [profilePicture, setProfilePicture] = useState("/profile-placeholder.png");
    const [isEditing, setIsEditing] = useState(false);
    const [nameInput, setNameInput] = useState(userName);
    const [emailInput, setEmailInput] = useState(userEmail);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const startEditing = () => {
        setNameInput(userName);
        setEmailInput(userEmail);
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setNameInput(userName);
        setEmailInput(userEmail);
    };

    const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmedName = nameInput.trim();
        const trimmedEmail = emailInput.trim();

        setUserName((current) => trimmedName || current);
        setUserEmail((current) => trimmedEmail || current);
        setIsEditing(false);
    };

    const handleProfilePictureChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setProfilePicture(reader.result);
            }
        };
        reader.readAsDataURL(file);
        event.target.value = "";
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleLogout = () => {
        console.info("Logout button clicked");
    };

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <section className={styles.card}>
                    <header className={styles.profileHeader}>
                        <div className={styles.pictureWrapper}>
                            <img
                                className={styles.avatar}
                                src={profilePicture}
                                alt={`${userName} profile`}
                            />
                            <input
                                ref={fileInputRef}
                                className={styles.fileInput}
                                type="file"
                                accept="image/*"
                                onChange={handleProfilePictureChange}
                            />
                            <Button className={styles.changePictureButton} onClick={triggerFileInput}>
                                Change Photo
                            </Button>
                        </div>

                        <div className={styles.profileDetails}>
                            <h1 className={styles.name}>{userName}</h1>
                            <p className={styles.email}>{userEmail}</p>
                            <p className={styles.helperText}>Keep your information up to date for a better experience.</p>
                        </div>
                    </header>

                    {isEditing ? (
                        <form className={styles.editForm} onSubmit={handleProfileSubmit}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label} htmlFor="name">
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    className={styles.input}
                                    value={nameInput}
                                    onChange={(event) => setNameInput(event.target.value)}
                                    placeholder="Enter your full name"
                                    maxLength={60}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label} htmlFor="email">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    className={styles.input}
                                    value={emailInput}
                                    onChange={(event) => setEmailInput(event.target.value)}
                                    placeholder="name@example.com"
                                    type="email"
                                />
                            </div>

                            <div className={styles.buttonGroup}>
                                <Button className={styles.primaryButton} type="submit">
                                    Save Changes
                                </Button>
                                <Button className={styles.ghostButton} onClick={handleCancelEdit}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className={styles.actions}>
                            <Button className={styles.primaryButton} onClick={startEditing}>
                                Edit Profile
                            </Button>
                            <Button className={styles.ghostButton} onClick={handleLogout}>
                                Logout
                            </Button>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
};

export default ProfileP;