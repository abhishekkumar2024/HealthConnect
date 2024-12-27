const Button = ({ width = 'w-full', name = 'Login', onClick }) => {
    return (
        <div className={`flex justify-center ${width} items-center rounded-md shadow-lg bg-blue-900 p-3 mt-4`}>
            <button
                className="text-white font-medium w-full"
                onClick={onClick} // Correct property name
            >
                {name}
            </button>
        </div>
    );
};

export { Button };
