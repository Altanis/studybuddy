export default function Info({ icon, header, paragraph }) {
    return (
        <div className="flex flex-row basis-full pb-[5%]">
            <div>
                <i className={icon}></i>
            </div>
            <div className="flex-column pl-5">
                <h2 className="text-lg font-semibold">{header}</h2>
                <p className="text-sm">{paragraph}</p>
            </div>
        </div>
    )
};