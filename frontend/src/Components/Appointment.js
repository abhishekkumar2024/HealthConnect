import { useDarkMode } from "../contextAPI/contextApi"
const fetchallAppointments = async () => {
    const { themeStyles } = useDarkMode();
    return (
        <div className = {`${themeStyles.featureCard}`}>
            
        </div>
    )
}