interface HomeProps {
  count: number
}

export default function Home(props: HomeProps) {
  return (
    <h1>Contagem de bolões: {props.count}</h1>
  )
}

// DADOS QUE SERÃO CALCULADO DO LADO DO SERVIDOR
export const getServerSideProps = async () => {
  const response = await fetch('http://localhost:3333/pools/count')
  const data = await response.json()

  return {
    props: {
      count: data.count,
    }
  }
}