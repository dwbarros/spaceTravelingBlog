import { MouseEvent, useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR'
;
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


export default function Home({ postsPagination }: HomeProps) {

  const [posts, setPosts] = useState<Post[]>(formatPosts(postsPagination.results));
  const [nextPage, setNextPage] = useState<string>(postsPagination.next_page);


  async function handleNextPage(event: MouseEvent) {
    event.preventDefault();

    if (!nextPage) {
      return;
    }
    
    await fetch(nextPage)
      .then(response => response.json())
      .then(data => updatePosts(data))
      .catch(err => {
        alert('Erro ao tentar buscar dados');
        console.log(err);
      });
  }

  function updatePosts(data: PostPagination) {
    const newPosts = formatPosts(data.results);
    setPosts([...posts, ...newPosts]);
    setNextPage(data.next_page);
  }

  function formatPosts(unformattedPosts: Post[]) {
    const formattedPosts = unformattedPosts.map((post: Post) => {
      return {
        ...post,
        first_publication_date: format(
          new Date(post.first_publication_date), 
          'dd MMM yyyy', 
          {
            locale: ptBR,
          }),
      }
    });

    return formattedPosts;
  }


  return (
    <>
      <Head>
        <title>spaceTraveling</title>
      </Head>

      <main className={`${styles.posts} ${commonStyles.container}`}>
        <ul className={styles.postList}>
          {posts.map(post => (
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
        {nextPage
          ? <button
            className={styles.bntMorePosts}
            onClick={handleNextPage}
          >
            Carregar mais posts
          </button>
          : null
        }
      </main>
    </>
  )
}


export const getStaticProps: GetStaticProps = async () => {

  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], {
    pageSize: 2,
  });

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts
  };

  return {
    props: {
      postsPagination,
    },
    revalidate: 60 * 60 // 1 hours
  }
}