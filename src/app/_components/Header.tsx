import Image from 'next/image'
import React from 'react'
import Link from 'next/link'

const Header = () => {
    return (
        <div className='flex justify-between p-5 shadow-sm'>
            <Link href="/">
                <Image
                    src="/edigo-logo.svg"
                    alt="Edigo Logo"
                    width={50}
                    height={50}
                />
            </Link>


        </div>
    )
}

export default Header