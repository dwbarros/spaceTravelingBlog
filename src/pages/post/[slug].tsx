import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import { GetStaticPaths, GetStaticProps } from 'next';
import Head from "next/head";
import { getPrismicClient } from '../../services/prismic';

import Prismic from '@prismicio/client';
import { RichText } from "prismic-dom";

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter } from 'next/router';


interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    average_reading_time: number;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}


export default function Post({ post }: PostProps) {
  const article = formatPost(post);
  const router = useRouter();


  function formatPost(unformattedPosts: Post) {
    return {
      ...unformattedPosts,
      first_publication_date: format(
        new Date(unformattedPosts.first_publication_date),
        "dd MMM' 'yyyy",
        {
          locale: ptBR,
        }
      ),
      data: {
        ...unformattedPosts.data,
        average_reading_time: getAverageReadingTime(unformattedPosts),
      },
    };
  }

  function getAverageReadingTime(post: Post) {
    return post.data.content.reduce((acc, content) => {
      const textBody = RichText.asText(content.body).split(' ');
      const number_words = textBody.length;

      const readingTime = Math.ceil(number_words / 200);
      return acc + readingTime;
    }, 0);
  }


  return (
    <>
      <Head>
        <title>{article.data.title} | spaceTraveling</title>
      </Head>

      {router.isFallback
        ? <p className={styles.loading}>Carregando...</p>
        : <main>
          <section className={styles.highlights}>
            <img src={article.data.banner.url} alt="banner"></img>
          </section>

          <article className={`${styles.content} ${commonStyles.container}`}>
            <section className={styles.contentHeader}>
              <h1>{article.data.title}</h1>

              <div className={styles.info}>
                <span className={styles.createdAt}>
                  <FiCalendar />
                  {article.first_publication_date}
                </span>

                <span className={styles.author}>
                  <FiUser />
                  {article.data.author}
                </span>

                <span className={styles.readTime}>
                  <FiClock />
                  {article.data.average_reading_time} min
                </span>
              </div>
            </section>

            <section className={styles.contentBody}>
              {article.data.content.map(content => {
                return (
                  <div key={content.heading} >
                    <h2>{content.heading}</h2>
                    <div dangerouslySetInnerHTML={{ __html: RichText.asHtml(content.body) }} />
                  </div>
                )
              })}
            </section>
          </article>
        </main>
      }
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(Prismic.predicates.at('document.type', 'post'));
  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid
      }
    }
  });

  return {
    paths,
    fallback: false
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(params.slug), {});

  if (!response) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const data = response.data;

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: data.title,
      subtitle: data.subtitle,
      banner: {
        url: data.banner.url,
      },
      author: data.author,
      content: data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    },
  }

  return {
    props: {
      post
    },
    redirect: 60 * 60 // 1 hour
  }
};