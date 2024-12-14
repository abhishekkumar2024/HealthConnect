const Button = ({ width = 'w-full', name = 'Login' }) => {
    return (
        <div className={`flex justify-center ${width} items-center rounded-md shadow-lg bg-blue-900 p-3 mt-4`}>
            <button className="text-white font-medium">{name}</button>
        </div>
    );
};

export { Button };
