import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';


interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home(props: HomeProps) {
  return (
    <>
      <Head>
        <title>spaceTraveling</title>
      </Head>

      <main className={commonStyles.container}>
        <ul className={styles.postList}>
          {props.postsPagination.results.map(post => (
            <li key={post.uid} className={styles.postItem}>
              <Link href={`/post/${post.uid}`}>
                <a>
                  <h2 className={styles.title}>{post.data.title}</h2>
                  <p>{post.data.subtitle}</p>
                </a>
              </Link>
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
            </li>
          ))}
        </ul>
      </main>
    </>
  )
}


export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], {
    // fetch: ['post.title, post.subtitle'],
    pageSize: 100,
  });

  const posts = postsResponse.results.map<Post>(post => {
    return {
      uid: post.uid,
      first_publication_date: new Date(post.first_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  });

  const postsPagination: PostPagination = {
    next_page: postsResponse.next_page,
    results: posts
  };

  return {
    props: {
      postsPagination
    }
  }
};
