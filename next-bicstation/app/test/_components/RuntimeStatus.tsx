// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/_components/RuntimeStatus.tsx

type Props = {

  status?: string

  executionTime?: number

  runtimeName?: string

}

export default function RuntimeStatus({

  status = 'OK',

  executionTime,

  runtimeName,

}: Props) {

  return (

    <section>

      <h2>

        Runtime Status

      </h2>

      {

        runtimeName && (

          <p>

            Runtime:
            {' '}
            {runtimeName}

          </p>

        )

      }

      <p>

        Status:
        {' '}
        {status}

      </p>

      {

        executionTime !== undefined && (

          <p>

            Execution Time:
            {' '}
            {executionTime}
            ms

          </p>

        )

      }

    </section>

  )

}