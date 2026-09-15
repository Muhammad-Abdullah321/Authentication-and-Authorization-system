import app from "./app.js";
import { connectDB ,PORT} from "./config/config.js";
import googlePassport from "./config/google.pass.config.js";
import githubPassport from "./config/github.passport.js";


app.use(googlePassport.initialize());
app.use(githubPassport.initialize());
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();