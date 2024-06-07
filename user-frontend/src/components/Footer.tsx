
import { FaInstagram, FaTwitter, FaFacebook } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-6 md:mb-0">
          <h3 className="text-xl font-semibold mb-3">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="#" target="_blank" ><FaInstagram className="text-white hover:text-gray-300" /></a>
            <a href="#" target="_blank" ><FaTwitter className="text-white hover:text-gray-300" /></a>
            <a href="#" target="_blank" ><FaFacebook className="text-white hover:text-gray-300" /></a>
          </div>
        </div>
        <div className="mb-6 md:mb-0">
          <h3 className="text-xl font-semibold mb-3">Quick Links</h3>
          <ul>
            <li><Link to="/user/home" className="text-gray-300 hover:text-white">Home</Link></li>
            <li><Link to="/user/create-task" className="text-gray-300 hover:text-white">Create a Task</Link></li>
            <li><Link to="/auth" className="text-gray-300 hover:text-white">Connect a new Wallet</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-3">Contact Us</h3>
          <p className="text-gray-300">Email: tineshsakthionline@gmail.com</p>
          <p className="text-gray-300">Phone: +91 6383-180-146</p>
        </div>
      </div>
      <div className="text-center mt-8">
        <p className="text-gray-300">&copy; {new Date().getFullYear()} Tinesh Works. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
