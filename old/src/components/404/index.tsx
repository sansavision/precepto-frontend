import { Link } from 'react-router-dom';

export const Page404 = () => {
  return (
    <div className="flex flex-col justify-center items-center flex-1">
      <div className="text-center">
        <h1 className="text-3xl">Siden ble ikke funnet</h1>
        <img width={400} src="/assets/404 Error-rafiki.svg" alt="404" />
      </div>
      <div className="text-center md:text-start">
        <div className="grid gap-2">
          <div>
            <Link to="/">La oss gå tilbake</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
