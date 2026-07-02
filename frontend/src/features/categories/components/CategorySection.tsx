import Image from "next/image";
import Link from "next/link";
import { foodCategories } from "../constants/food-categories";

export default function CategorySection() {
  return (
<section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12" dir="rtl">
  <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-5">
        {foodCategories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="relative w-full aspect-square overflow-hidden rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-105">
              <Image
                src={category.image}
                alt={category.title}
                fill
                className="object-cover"
              />
            </div>

            <h3 className="mt-3 text-base font-medium text-gray-800 transition-colors group-hover:text-orange-700 md:text-xl"> 
                  {category.title}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}