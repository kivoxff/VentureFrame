import { Link } from "react-router-dom";
import logo from "../../assets/images/logo.svg";
import locationIcon from "../../assets/icons/location.svg";
import githubIcon from "../../assets/icons/github.svg";
import mailIcon from "../../assets/icons/mail.svg";

function Footer() {
    const footerLinks = [
        {
            id: 1,
            name: "Home",
        },
        {
            id: 2,
            name: "About",
        },
        {
            id: 3,
            name: "Contact",
        },
        {
            id: 4,
            name: "Products",
        }
    ]

    return (
        <footer className="py-4 px-4 sm:px-12 w-full bg-violet-950 text-gray-300">
            <div className="flex justify-around gap-4 flex-wrap">
                {/* Brand */}
                <div className="p-3 w-full md:w-1/4 h-fit border flex flex-col justify-around gap-4">
                    <Link to={"/"} className="w-20 border">
                        <img src={logo} alt="VentureFrame" className="w-full" />
                    </Link>
                    <p className="w-full text-sm text-justify text-gray-400">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Culpa, dicta accusamus. Deleniti ab ipsum enim totam harum deserunt odio! Non.</p>
                </div>

                {/* Quick Links */}
                <div className="p-3 w-full md:w-1/4 border">
                    <h3 className="mb-4 text-white uppercase font-semibold underline underline-offset-4">Quick Links</h3>
                    <ul className="space-y-2">

                        {footerLinks.map((item) => (
                            <li key={item}><Link className="text-sm hover:text-white transition-colors">{item.name}</Link></li>
                        ))}
                    </ul>
                </div>

                {/* Contact */}
                <div className="p-3 w-full md:w-1/4 border">
                    <h3 className="mb-4 text-white uppercase font-semibold underline underline-offset-4">Contact</h3>

                    <ul className="space-y-4">
                        <li className="flex gap-4 items-center">
                            <img src={locationIcon} alt="Address" className="w-5 shrink-0" />
                            <p className="text-sm text-gray-400">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Non, maiores.</p>
                        </li>

                        <li>
                            <Link className="flex gap-4 items-center text-sm text-gray-400 hover:text-white transition-colors">
                                <img src={githubIcon} alt="Address" className="w-5 shrink-0" />
                                Lorem ipsum dolor sit amet.
                            </Link>
                        </li>

                        <li>
                            <Link className="flex gap-4 items-center text-sm text-gray-400 hover:text-white transition-colors">
                                <img src={mailIcon} alt="Address" className="w-5 shrink-0" />
                                Lorem ipsum dolor sit amet.
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-blue-900 text-center py-4 text-xs text-gray-500">
                © {new Date().getFullYear()} VentureFrame. All rights reserved.
            </div>
        </footer>
    )
}

export default Footer;
