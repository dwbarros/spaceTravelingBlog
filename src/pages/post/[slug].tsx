import { FiCalendar, FiUser } from 'react-icons/fi';

import { GetStaticPaths, GetStaticProps } from 'next';
import Head from "next/head";
import { getPrismicClient } from '../../services/prismic';

import Prismic from '@prismicio/client';
import * as prismicH from '@prismicio/helpers';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';


interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string | null;
      body: string;
    }[];
  };
}

interface PostProps {
  post: Post;
}


export default function Post({ post }: PostProps) {
  return (
    <>
      <Head>
        <title>{post.data.title} | spaceTraveling</title>
      </Head>

      <main className={commonStyles.container}>
        <img src={post.data.banner.url} alt="banner"></img>

        <h1>{post.data.title}</h1>

        <div className={styles.info}>
          <span className={styles.createdAt}>
            <FiCalendar />
            {post.first_publication_date}
          </span>

          <span className={styles.author}>
            <FiUser />
            {post.data.author}
          </span>
        </div>

        <article>
          {post.data.content.map(content => {
            return (
              <div key={content.heading} >
                <h2>{content.heading}</h2>
                <div dangerouslySetInnerHTML={{ __html: content.body }} />
              </div>
            )
          })}
        </article>
      </main>
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
  const response = await prismic.getByUID<any>('post', String(params.slug), {});
  const data = response.data;

  const content = data.content.map(content => {
    return {
      heading: content.heading,
      body: prismicH.asHTML(content.body),
    }
  })

  const post = {
    first_publication_date: new Date(response.first_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }),
    data: {
      title: data.title,
      banner: {
        url: data.banner.url,
      },
      author: data.author,
      content: content,
    },
  }

  return {
    props: {
      post
    },
    redirect: 60 * 60 // 1 hour
  }
};
