import { slug } from "github-slugger";
import React from "react";
import Category from "./Category";

const Categories = ({ categories, currentSlug }) => {
    return (
        <nav aria-label="Categories" className="container-page mt-8">
            <div className="glass rounded-full p-2 flex items-center gap-1 flex-wrap w-fit max-w-full">
                {categories.map((category) => (
                    <Category
                        key={category}
                        link={`/categories/${category}`}
                        name={category}
                        active={currentSlug === slug(category)}
                    />
                ))}
            </div>
        </nav>
    );
};

export default Categories;
