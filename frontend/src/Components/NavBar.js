const NavBar = () => {
    return (
        <nav className="px-5 py-5 mx-5 flex justify-between items-center">
            <div className="flex py-4 px-4 space-x-4">
                <img src="" alt="" />
                <a href="/" className="text-2xl hover:font-extrabold hover:shadow-sm">HealthConnect</a>
            </div>
            <div className="flex space-x-6 px-7">
                <a href="/login" className="text-xl">Login</a>
                <a href="/Register" className="text-xl">Register</a>
                <button className="text-xl">
                   Dark
                </button>
            </div>
        </nav>
    );
};

export {NavBar}