import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { MouseEvent, useEffect, useState } from 'react';
import { ApiData } from '@prismicio/client/types/ResolvedApi';
import { ApiOptions } from '@prismicio/client/types/Api';


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

  const [posts, setPosts] = useState<Post[]>(postsPagination.results);


  function handleNextPage(event: MouseEvent) {
    event.preventDefault();

    fetch(postsPagination.next_page, {
      method: 'GET',
      mode: 'cors',
      cache: 'default'
    })
      .then(response => response.json())
      .then(data => updatePosts(data))
      .catch(err => console.log(err))
  }

  function updatePosts(data: any) {
    console.log(data)
    const newPosts = data.results.map((post) => {
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
          author: post.data.author
        }
      }
    });
    const postList = [...posts, newPosts];
    setPosts( postList );
  }
  

  return (
    <>
      <Head>
        <title>spaceTraveling</title>
      </Head>

      <main className={commonStyles.container}>
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
        <button
          className={styles.bntMorePosts}
          onClick={handleNextPage}
        >
          Carregar mais posts
        </button>
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

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts
  };


  return {
    props: {
      postsPagination,
    }
  }
};