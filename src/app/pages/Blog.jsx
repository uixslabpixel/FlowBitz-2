import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Book, Calendar, FileText, ChevronDown } from "lucide-react";
import SEO from "../components/SEO.jsx";
import { PageHeader } from "../components/redesign/AppShell.jsx";
import { getAllPosts } from "../data/blogPosts.js";
import Footer from "../components/layout/Footer.jsx";
import { seoPages } from "../content/brandCopy.js";

const posts = getAllPosts();
const POSTS_PER_PAGE = 10;

const formatDate = (value) => {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  } catch (error) {
    console.warn("Unable to format date", value, error);
    return value;
  }
};

const Blog = () => {
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);

  return (
    <>
      <SEO
        title={seoPages.blog.title}
        description={seoPages.blog.description}
        url="https://www.flowbitz.dev/blog"
        keywords={seoPages.blog.keywords}
      />
      <div className="relative z-[2] text-foreground">
        <PageHeader
          title={<>Motion craft and release notes</>}
          description={<>Tutorials, release notes, and workflows for serious Webflow creators—ship premium motion with FlowBitz and less friction.</>}
        />
        <div className="m-4 lg:m-6 bg-white rounded-lg overflow-hidden relative z-[2] flex flex-col">

          <section
            wb-component="smart-animate"
            wb-start-delay="0.2"
            className="flex flex-col"
          >
            <div className="flex flex-col">
              {posts.slice(0, visibleCount).map((post, index) => (
                <>
                  <article
                    key={post.slug}
                    className={`group flex flex-col gap-4 md:gap-8 sm:flex-row overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl border-b border-foreground/10 p-4
                  `}>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="relative w-full aspect-[179/80] md:aspect-video md:w-[470px] sm:self-stretch sm:flex-shrink-0 overflow-hidden bg-muted"
                    >
                      <img
                        src={post.heroImage}
                        alt={post.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </Link>

                    <div className="flex w-full md:py-[0.625rem] justify-between">
                      <div className="flex flex-col px-3 md:px-0 gap-2 w-full md:w-[80%]">
                        <div className="inline-flex items-center gap-2 text-link font-medium text-text-medium">
                          <div className="flex lg:hidden gap-1.5 items-center">
                            <div className="w-5 h-5 flex items-center justify-center">
                              <Calendar
                                className="w-4 h-4"
                              />
                            </div>
                            <span>{formatDate(post.publishedAt)}</span>
                          </div>

                          <span className="block lg:hidden" aria-hidden="true">
                            •
                          </span>

                          <span>{post.readingMinutes} min read</span>
                        </div>

                        <Link
                          to={`/blog/${post.slug}`}
                          className="group/title inline-flex md:text-balance"
                        >
                          <h2 className="inter-semi-24 text-foreground">
                            {post.title}
                          </h2>
                        </Link>

                        <div className="hidden md:flex flex-wrap gap-2">
                          {post.tags?.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-link font-medium text-text-medium"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="hidden lg:block h-full pt-4">
                        <div className="flex gap-1.5 items-center text-text-medium">
                          <div className="w-5 h-5 flex items-center justify-center">
                            <Calendar
                              className="w-4 h-4"
                            />
                          </div>
                          <span>{formatDate(post.publishedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </article>

                  {index === posts.length - 1 ? (
                    ""
                  ) : (
                    <div className="block md:hidden h-[1px] w-full bg-foreground/10" />
                  )}
                </>
              ))}

              {visibleCount < posts.length && (
                <div className="flex justify-center pt-[7.5rem] mb-7 md:pt-12 md:pb-18">
                  <button
                    onClick={() =>
                      setVisibleCount((prev) => prev + POSTS_PER_PAGE)
                    }
                    className="flex items-center gap-2 px-6 py-3 border border-foreground/10 rounded text-foreground hover:text-foreground/70 transition-colors duration-200"
                  >
                    <span className="text-sm font-medium">Load More</span>
<ChevronDown
                    className="w-4 h-4 opacity-60"
                  />
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Blog;
