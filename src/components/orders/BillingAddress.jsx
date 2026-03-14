function BillingAddress() {
    return (
        <div className="p-3 flex-1 border rounded-2xl">
            <h3 className="text-xl font-bold mb-3">Billing address</h3>

            <p className="flex mb-2">
                <span className="w-24 shrink-0 font-semibold">Name</span>
                <span className="break-all">Kumar Akshay</span>
            </p>

            <p className="flex mb-2">
                <span className="w-24 shrink-0 font-semibold">Email</span>
                <span className="break-all">KumarAkshay@gmail.com</span>
            </p>

            <p className="flex mb-2">
                <span className="w-24 shrink-0 font-semibold">Address</span>
                <span className="break-all">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero, porro ea
                    tenetur dolores dolorem veritatis error ipsa id repellendus magni?
                </span>
            </p>
        </div>
    )
}

export default BillingAddress;