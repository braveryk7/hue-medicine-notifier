'use client';

import PlanForm from './PlanForm';
import PlanList from './PlanList';
import { Tab } from './components/Tab';
import { LightType } from '@/app/types/HueLight';
import { TaskForm } from './components/TaskForm';
import { Log } from './components/Log';
import { Ruby } from '@/app/_components/Ruby';
import { use, useEffect, useState } from 'react';
import { Plan, User } from '@prisma/client';
import { getPlans, getUser } from './_actions/actions';
import { Loading } from '@/app/_components/Loading';

export default function Dashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const userId = Number(id);

  const [userData, setUserData] = useState<User | undefined>(undefined);
  const [plansData, setPlansData] = useState<Plan[] | undefined>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [user, plans] = await Promise.all([getUser(userId), getPlans(userId)]);
        setUserData(user);
        setPlansData(plans);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);
  if (isLoading) {
    return <Loading />;
  }

  if (!userData) {
    return (
      <p>
        ユーザーが
        <Ruby kanji="見" ruby="み" />
        つかりません。
      </p>
    );
  }

  if (!plansData) {
    return (
      <p>
        プランが
        <Ruby kanji="見" ruby="み" />
        つかりません。
      </p>
    );
  }

  if (!isValidLightType(userData.lightType)) {
    return (
      <p>
        サポート
        <Ruby kanji="対象外" ruby="たいしょうがい" />
        のライトです。
      </p>
    );
  }

  const displayItems = [
    { key: 'userId', title: 'ユーザーID', value: userData.id },
    {
      key: 'userName',
      title: (
        <>
          ユーザー
          <Ruby kanji="名" ruby="めい" />
        </>
      ),
      value: userData.name,
    },
    { key: 'lightId', title: 'ライトID', value: userData.lightId },
    {
      key: 'lightType',
      title: (
        <>
          ライト
          <Ruby kanji="種別" ruby="しゅべつ" />
        </>
      ),
      value: userData.lightType,
    },
    {
      key: 'planCount',
      title: (
        <>
          <Ruby kanji="登録" ruby="とうろく" />
          プラン
          <Ruby kanji="数" ruby="すう" />
        </>
      ),
      value: plansData.length,
    },
    {
      key: 'registeredAt',
      title: (
        <>
          ユーザー
          <Ruby kanji="登録日" ruby="とうろくび" />
        </>
      ),
      value: new Date(userData.registeredAt).toLocaleDateString('ja-JP'),
    },
  ];

  const tabItems = {
    task: { label: 'タスク', component: <TaskForm user={userData} plans={plansData} /> },
    plan: {
      label: 'プラン',
      component: <PlanForm userId={userId} lightType={userData.lightType} setPlansData={setPlansData} />,
    },
    log: { label: 'ログ', component: <Log userId={userId}></Log> },
  };

  return (
    <div
      className="
      p-4 pb-12 md:mx-auto md:grid md:w-full md:max-w-7xl md:grid-cols-2 md:gap-4 [&>div]:my-4 md:[&>div]:my-0
    "
    >
      <p className="block md:hidden">{userData.name}さん、こんにちは！</p>
      <div className="hidden rounded-lg border bg-gray-50 p-2 md:col-span-1 md:block">
        <h2 className="mb-2 text-center text-lg">
          ユーザー
          <Ruby kanji="情報" ruby="じょうほう" />
        </h2>
        <div id="userInfo" className="[&>*]:text-center md:[&>*]:leading-loose">
          {displayItems.map((item) => (
            <div key={item.key} className="grid grid-cols-2">
              <dt>{item.title}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </div>
      </div>
      <Tab>{tabItems}</Tab>
      <PlanList plans={plansData} user={userData} />
    </div>
  );
}

const isValidLightType = (value: string): value is LightType => {
  return ['color', 'whiteAmbiance', 'white'].includes(value);
};
