import Image from "next/image";
import { FC } from "react";

interface HouseCardProps {
  imageUrl: string;
  price: string;
  location: string;
  area: string;
  description: string;
}

const HouseCard: FC<HouseCardProps> = ({
  imageUrl,
  price,
  location,
  area,
  description,
}) => {
  return (
    <div className="house-info bg-black">
      <div className="house-image">
        <Image
          src={imageUrl}
          alt="House"
          width={400}
          height={300}
          layout="responsive"
        />
      </div>
      <div className="house-price">
        <span>{price}</span>
      </div>
      <ul className="house-meta">
        <li>{location}</li>
        <li>
          {area}
          <sup>2</sup>
        </li>
        <li>{description}</li>
      </ul>
    </div>
  );
};

export default HouseCard;
