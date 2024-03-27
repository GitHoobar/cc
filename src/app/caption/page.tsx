import Link from 'next/link';

export default function Caption() {
    return (
        <>
            <div className="relative w-full h-screen">
                <div className="absolute inset-0 overflow-hidden">
                    <video className="w-full h-full object-cover" autoPlay loop muted>
                        <source src="/images/table.mp4" type="video/mp4" />
                    </video>
                </div>
                <div className="absolute left-1/2 bottom-8 transform -translate-x-1/2">
                    <Link href="/caption/craft1">
                        <button style={{fontFamily:'minecraft'}} className="minecraft-btn w-64 text-center text-white truncate p-1 border-2 border-b-4 hover:text-yellow-200">Enchant</button>
                    </Link>
                </div>
            </div>
        </>
    )
}
