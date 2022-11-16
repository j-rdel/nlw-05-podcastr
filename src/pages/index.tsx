import {GetStaticProps} from 'next';
import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';
import axios from "axios";
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';
import styles from './home.module.scss';
import { usePlayer } from '../contexts/PlayerContext';

type Episode = {
  id: string;
  title: string;
  members: string;
  thumbnail: string;
  published_at: string;
  duration: number;
  durationAsString: string;
  url: string;
  publishedAt: string;
}

type HomeProps = {
  latestMusics: Episode[];
  allMusics: Episode[];
}

export default function Home({latestMusics, allMusics}: HomeProps) {

  const { playList } = usePlayer();

  const musicList = [...latestMusics, ...allMusics];

  return (
    <div className={styles.homepage}>
      <Head>
        <title>Music Player</title>
      </Head>

      <section className={styles.latestEpisodes}>
        <h2>Adicionadas recentemente</h2>
        <ul>
          {latestMusics.map((episode, index) => {
            return (
              <li key={episode.id}>
                <Image 
                width={100} 
                height={100} 
                src={episode.thumbnail} 
                alt={episode.title} 
                objectFit="cover" 
              />

                <div className={styles.episodeDetails}>
                  <Link href={'#'}>
                    <a>{episode.title}</a>
                  </Link>
                  <p>{episode.members}</p>
                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationAsString}</span>
                </div>

                <button type="button" onClick={() => playList(musicList, index)}>
                  <img src="/play-green.svg" alt="Tocar episódio"/>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className={styles.allEpisodes}>
          <h2>Todas as músicas</h2>

          <table cellSpacing={0}>
            <thead>
              <tr>
                <th></th>
                <th>Musica</th>
                <th>Artista</th>
                <th>Data</th>
                <th>Duração</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {allMusics.map((music, index) => {
                return (
                  <tr key={music.id}>
                    <td style={{width: 72}}>
                      <Image width={120} height={120} src={music.thumbnail} alt={music.title} objectFit="cover"/>
                    </td>
                    <td>
                      <Link href={'#'}>
                        <a>{music.title}</a>
                      </Link>
                    </td>
                    <td>{music.members}</td>
                    <td style={{width: 100}}>{music.publishedAt}</td>
                    <td>{music.durationAsString}</td>
                    <td>
                      <button type="button" onClick={() => playList(musicList, index + latestMusics.length)}>
                        <img src="/play-green.svg" alt="Tocar episodio"/>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
      </section>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {

  const {data} = await axios.get('https://5efo7j5bv7.execute-api.us-east-1.amazonaws.com/api-music-player/musics');

  if (data.Items){
    const playlist = data.Items.map(music =>{
      return {
        id: music.id,
        title: music.title,
        thumbnail: music.thumbnail,
        members: music.members,
        publishedAt: music.published_at,
        duration: Number(music.file.duration),
        durationAsString: convertDurationToTimeString(Number(music.file.duration)),
        url: music.file.url,
      }
    }).sort()

    const latestMusics = playlist.slice(0, 2);
    const allMusics = playlist.slice(2, playlist.length);

    return {
      props: {
        latestMusics,
        allMusics,
      },
      revalidate: 60 * 60 * 8,
    }
  }

  return
}