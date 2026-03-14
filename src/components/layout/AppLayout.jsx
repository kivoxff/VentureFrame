import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";

function AppLayout({ children }) {

    console.log(children);
    return (
        <div className="min-w-72">
            <Navbar />
            {children}
            <Footer />
        </div>
    )
}

export default AppLayout;