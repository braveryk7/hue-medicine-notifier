import prisma from '../lib/prisma';
import { Footer } from './_components/Footer';
import { Ruby } from './_components/Ruby';

export const dynamic = 'force-dynamic';

const Home = async () => {
  const users = await prisma.user.findMany();

  return (
    <>
      <main className="grow">
        <section id="users" className="flex flex-col items-center justify-center">
          <div className="rounded-xl border border-gray-200">
            {users.map((user, index) => (
              <div key={user.id}>
                <a
                  href={`/users/${user.id}/dashboard`}
                  className="flex items-center justify-center px-16 py-8 hover:bg-gray-100 md:min-w-96"
                >
                  <span className="text-center">{user.name}</span>
                </a>
                {index !== users.length - 1 && <hr className="border-b border-gray-100" />}
              </div>
            ))}
          </div>
        </section>
        <section id="newUser" className="mt-16 flex justify-center">
          <a href="/register" className="rounded-xl bg-blue-200 px-12 py-4 hover:bg-blue-300">
            ユーザー
            <Ruby kanji="登録" ruby="とうろく" />
          </a>
        </section>
        <Footer />
      </main>
    </>
  );
};

export default Home;
