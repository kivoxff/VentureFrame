function ShippingDetails() {
    return (
        <form className="w-full sm:flex-1 flex flex-col h-fit gap-3">
            <fieldset className="w-full flex gap-2">
                <input type="text" placeholder="First Name" className="w-full p-2 border rounded-xl" />
                <input type="text" placeholder="Last Name" className="w-full p-2 border rounded-xl" />
            </fieldset>

            <input type="email" placeholder="Enter Your Email" className="w-full p-2 border rounded-xl" />
            <textarea type="text" placeholder="Street Address" className="w-full h-28 p-2 border rounded-xl" />

            <fieldset className="w-full flex gap-2">
                <input type="text" placeholder="City" className="w-full p-2 border rounded-xl" />
                <input type="text" placeholder="PIN Code" className="w-full p-2 border rounded-xl" />
            </fieldset>

            <fieldset className="flex flex-wrap gap-4">
                <label className="flex">
                    <input type="radio" name="pay" defaultChecked />
                    <span className="ml-2 text-nowrap">Cash On Delivary</span>
                </label>

                <label className="flex">
                    <input type="radio" name="pay" />
                    <span className="ml-2 text-nowrap">UPI / Card / Netbanking</span>
                </label>
            </fieldset>

            <button type="submit" className="w-full p-2 bg-violet-700 hover:bg-violet-600 text-white font-bold rounded-xl">Make Payment</button>
        </form>
    )
}

export default ShippingDetails;