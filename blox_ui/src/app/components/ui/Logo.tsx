import Image from 'next/image';

const Logo = ({ size }: { size: number }) => {
  return (
    <Image src="/blox-logo.png" alt="BloX Logo" width={size} height={size} className="rounded-xl" />
  );
};

export default Logo;
